import React, { useState, useEffect } from 'react';
import {
    Container,
    Grid,
    Typography,
    TextField,
    Button,
    List,
    ListItem,
    IconButton,
    Box,
    Card,
    CardContent,
    Chip,
    Alert,
    Fade,
    CircularProgress,
    useTheme
} from '@mui/material';
import { 
    Remove as RemoveIcon,
    TrendingUp as TrendingUpIcon,
    TrendingDown as TrendingDownIcon,
    Search as SearchIcon
} from '@mui/icons-material';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import { useStock } from '../../contexts/StockContext';
import PriceAlerts from '../alerts/PriceAlerts';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const StockDashboard = () => {
    const theme = useTheme();
    const { selectedStock } = useStock();
    const { watchlist, stockData, updateWatchlist, getStockQuote } = useStock();
    const [newSymbol, setNewSymbol] = useState('');
    const [priceHistory, setPriceHistory] = useState({});
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Update price history when new stock data arrives
        Object.entries(stockData).forEach(([symbol, data]) => {
            setPriceHistory(prev => ({
                ...prev,
                [symbol]: [
                    ...(prev[symbol] || []).slice(-29),
                    { price: data.price, time: new Date(data.timestamp) }
                ]
            }));
        });
    }, [stockData]);

    const handleAddSymbol = async () => {
        try {
            setError('');
            if (!newSymbol) return;
            
            setIsLoading(true);
            // Verify the symbol exists by getting a quote
            await getStockQuote(newSymbol.toUpperCase());
            await updateWatchlist(newSymbol.toUpperCase(), 'add');
            setNewSymbol('');
        } catch (error) {
            setError('Invalid stock symbol');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemoveSymbol = (symbol) => {
        updateWatchlist(symbol, 'remove');
    };

    return (
        <Box sx={{
            minHeight: '100vh',
            background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, #FFFFFF 100%)`,
            pt: 4,
            pb: 8
        }}>
            <Container maxWidth="lg">
                <Grid container spacing={4}>
                {/* Header */}
                <Grid item xs={12}>
                    <Box sx={{ mb: 6, textAlign: 'center' }}>
                        <Typography variant="h2" component="h1" 
                            sx={{ 
                                fontWeight: 700,
                                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                mb: 2
                            }}
                        >
                            Stock Dashboard
                        </Typography>
                        <Typography variant="h6" sx={{ color: theme.palette.text.secondary, fontWeight: 400 }}>
                            Track your favorite stocks in real-time
                        </Typography>
                    </Box>
                </Grid>

                {/* Add Stock Form */}
                <Grid item xs={12}>
                    <Card 
                        elevation={0}
                        sx={{
                            background: 'rgba(255, 255, 255, 0.8)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                            overflow: 'hidden',
                        }}
                    >
                        <CardContent sx={{ p: 4 }}>
                            <Typography variant="h5" gutterBottom sx={{ 
                                fontWeight: 600,
                                color: theme.palette.text.primary,
                                mb: 3
                            }}>
                                Add Stock to Watchlist
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                                <TextField
                                    label="Stock Symbol"
                                    value={newSymbol}
                                    onChange={(e) => setNewSymbol(e.target.value.toUpperCase())}
                                    error={!!error}
                                    helperText={error}
                                    placeholder="Enter symbol (e.g., AAPL)"
                                    sx={{
                                        width: { xs: '100%', sm: 200 },
                                        '& .MuiOutlinedInput-root': {
                                            backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                            borderRadius: 2,
                                            transition: 'all 0.2s',
                                            '&:hover': {
                                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                            },
                                            '&.Mui-focused': {
                                                backgroundColor: '#FFFFFF',
                                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                                            },
                                        },
                                    }}
                                />
                                <Button
                                    variant="contained"
                                    onClick={handleAddSymbol}
                                    startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
                                    disabled={isLoading}
                                    sx={{
                                        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                                        px: 3,
                                        py: 1,
                                        borderRadius: 2,
                                        boxShadow: `0 4px 12px ${theme.palette.primary.main}40`,
                                        transition: 'all 0.2s',
                                        '&:hover': {
                                            transform: 'translateY(-1px)',
                                            boxShadow: `0 6px 16px ${theme.palette.primary.main}60`,
                                        },
                                        '&:active': {
                                            transform: 'translateY(0)',
                                        },
                                    }}
                                >
                                    {isLoading ? 'Searching...' : 'Search & Add'}
                                </Button>
                            </Box>
                            {error && (
                                <Fade in={!!error}>
                                    <Alert severity="error" sx={{ mt: 2 }}>
                                        {error}
                                    </Alert>
                                </Fade>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Watchlist */}
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <PriceAlerts symbol={selectedStock} />
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card 
                        elevation={0}
                        sx={{
                            background: 'rgba(255, 255, 255, 0.8)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column'
                        }}
                    >
                        <CardContent sx={{ p: 0, flex: 1 }}>
                            <Box sx={{ 
                                p: 3,
                                borderBottom: `1px solid ${theme.palette.divider}`,
                                background: 'rgba(255, 255, 255, 0.5)',
                                backdropFilter: 'blur(20px)'
                            }}>
                                <Typography variant="h6" sx={{ 
                                    fontWeight: 600,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1
                                }}>
                                    <TrendingUpIcon sx={{ color: theme.palette.primary.main }} />
                                    Watchlist
                                </Typography>
                            </Box>
                            <List sx={{ p: 0 }}>
                                {watchlist.map((symbol) => {
                                    const stockInfo = stockData[symbol];
                                    const price = stockInfo?.price;
                                    const isPositive = stockInfo?.change > 0;
                                    
                                    return (
                                        <ListItem
                                            key={symbol}
                                            sx={{
                                                px: 3,
                                                py: 2,
                                                borderBottom: `1px solid ${theme.palette.divider}`,
                                                transition: 'all 0.2s',
                                                '&:hover': {
                                                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                                }
                                            }}
                                            secondaryAction={
                                                <IconButton
                                                    edge="end"
                                                    onClick={() => handleRemoveSymbol(symbol)}
                                                    sx={{ 
                                                        color: theme.palette.error.main,
                                                        opacity: 0.7,
                                                        transition: 'all 0.2s',
                                                        '&:hover': {
                                                            opacity: 1,
                                                            backgroundColor: `${theme.palette.error.main}10`,
                                                        }
                                                    }}
                                                >
                                                    <RemoveIcon />
                                                </IconButton>
                                            }
                                        >
                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    <Typography 
                                                        variant="subtitle1" 
                                                        sx={{ 
                                                            fontWeight: 600,
                                                            fontSize: '1.1rem',
                                                            letterSpacing: '-0.01em'
                                                        }}
                                                    >
                                                        {symbol}
                                                    </Typography>
                                                    {stockInfo && (
                                                        <Chip
                                                            size="small"
                                                            icon={isPositive ? <TrendingUpIcon /> : <TrendingDownIcon />}
                                                            label={`${isPositive ? '+' : ''}${stockInfo.change.toFixed(2)}%`}
                                                            color={isPositive ? 'success' : 'error'}
                                                            sx={{
                                                                fontWeight: 500,
                                                                background: isPositive 
                                                                    ? `${theme.palette.success.main}15`
                                                                    : `${theme.palette.error.main}15`,
                                                                border: 'none',
                                                                '& .MuiChip-icon': {
                                                                    fontSize: '1rem'
                                                                }
                                                            }}
                                                        />
                                                    )}
                                                </Box>
                                                <Typography 
                                                    variant="h6" 
                                                    sx={{ 
                                                        fontWeight: 600,
                                                        color: theme.palette.text.primary,
                                                        letterSpacing: '-0.02em'
                                                    }}
                                                >
                                                    {price 
                                                        ? `$${price.toFixed(2)}`
                                                        : 'Loading...'}
                                                </Typography>
                                            </Box>
                                        </ListItem>
                                    );
                                })}
                                {watchlist.length === 0 && (
                                    <Box sx={{ 
                                        p: 6, 
                                        textAlign: 'center',
                                        color: theme.palette.text.secondary,
                                        background: 'rgba(255, 255, 255, 0.5)'
                                    }}>
                                        <TrendingUpIcon sx={{ 
                                            fontSize: 48, 
                                            color: theme.palette.grey[300],
                                            mb: 2
                                        }} />
                                        <Typography variant="h6" sx={{ 
                                            color: theme.palette.text.secondary,
                                            fontWeight: 500,
                                            mb: 1
                                        }}>
                                            Your watchlist is empty
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                                            Add stocks above to track their prices in real-time
                                        </Typography>
                                    </Box>
                                )}
                            </List>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Charts */}
                <Grid item xs={12} md={8}>
                    <Card 
                        elevation={0}
                        sx={{
                            background: 'rgba(255, 255, 255, 0.8)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                            height: '100%'
                        }}
                    >
                        <CardContent sx={{ p: 0 }}>
                            <Box sx={{ 
                                p: 3,
                                borderBottom: `1px solid ${theme.palette.divider}`,
                                background: 'rgba(255, 255, 255, 0.5)',
                                backdropFilter: 'blur(20px)'
                            }}>
                                <Typography variant="h6" sx={{ 
                                    fontWeight: 600,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1
                                }}>
                                    <TrendingUpIcon sx={{ color: theme.palette.primary.main }} />
                                    Price History
                                </Typography>
                            </Box>
                            <Box sx={{ p: 3 }}>
                                {watchlist.map((symbol) => (
                                    <Card
                                        key={symbol}
                                        elevation={0}
                                        sx={{
                                            mb: 3,
                                            background: 'rgba(255, 255, 255, 0.5)',
                                            border: '1px solid rgba(255, 255, 255, 0.2)',
                                            borderRadius: 2,
                                            overflow: 'hidden',
                                            '&:last-child': { mb: 0 }
                                        }}
                                    >
                                        <CardContent sx={{ p: 3 }}>
                                            <Box sx={{ 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                justifyContent: 'space-between',
                                                mb: 2
                                            }}>
                                                <Typography 
                                                    variant="h6" 
                                                    sx={{ 
                                                        fontWeight: 600,
                                                        letterSpacing: '-0.01em'
                                                    }}
                                                >
                                                    {symbol}
                                                </Typography>
                                                {stockData[symbol] && (
                                                    <Chip
                                                        size="small"
                                                        icon={stockData[symbol].change > 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
                                                        label={`${stockData[symbol].change > 0 ? '+' : ''}${stockData[symbol].change.toFixed(2)}%`}
                                                        color={stockData[symbol].change > 0 ? 'success' : 'error'}
                                                        sx={{
                                                            fontWeight: 500,
                                                            background: stockData[symbol].change > 0
                                                                ? `${theme.palette.success.main}15`
                                                                : `${theme.palette.error.main}15`,
                                                            border: 'none'
                                                        }}
                                                    />
                                                )}
                                            </Box>
                                            {priceHistory[symbol] && priceHistory[symbol].length > 0 ? (
                                                <Box sx={{ 
                                                    height: 200,
                                                    '.chartjs-render-monitor': {
                                                        borderRadius: 2,
                                                    }
                                                }}>
                                                    <Line
                                                        data={{
                                                            labels: priceHistory[symbol].map(d =>
                                                                d.time.toLocaleTimeString()
                                                            ),
                                                            datasets: [
                                                                {
                                                                    label: symbol,
                                                                    data: priceHistory[symbol].map(d => d.price),
                                                                    borderColor: theme.palette.primary.main,
                                                                    backgroundColor: `${theme.palette.primary.main}10`,
                                                                    borderWidth: 2,
                                                                    fill: true,
                                                                    tension: 0.4,
                                                                    pointRadius: 0,
                                                                    pointHitRadius: 20
                                                                }
                                                            ]
                                                        }}
                                                        options={{
                                                            responsive: true,
                                                            maintainAspectRatio: false,
                                                            plugins: {
                                                                legend: {
                                                                    display: false
                                                                },
                                                                tooltip: {
                                                                    mode: 'index',
                                                                    intersect: false,
                                                                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                                                    titleColor: theme.palette.text.primary,
                                                                    bodyColor: theme.palette.text.secondary,
                                                                    borderColor: theme.palette.divider,
                                                                    borderWidth: 1,
                                                                    padding: 12,
                                                                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                                                                    titleFont: {
                                                                        size: 14,
                                                                        weight: 600
                                                                    },
                                                                    bodyFont: {
                                                                        size: 13
                                                                    },
                                                                    callbacks: {
                                                                        label: function(context) {
                                                                            return `$${context.parsed.y.toFixed(2)}`;
                                                                        }
                                                                    }
                                                                }
                                                            },
                                                            scales: {
                                                                x: {
                                                                    grid: {
                                                                        display: false
                                                                    },
                                                                    ticks: {
                                                                        maxRotation: 0,
                                                                        font: {
                                                                            size: 11
                                                                        },
                                                                        color: theme.palette.text.secondary
                                                                    }
                                                                },
                                                                y: {
                                                                    grid: {
                                                                        color: theme.palette.divider,
                                                                        drawBorder: false
                                                                    },
                                                                    ticks: {
                                                                        font: {
                                                                            size: 11
                                                                        },
                                                                        color: theme.palette.text.secondary,
                                                                        callback: function(value) {
                                                                            return `$${value.toFixed(2)}`;
                                                                        }
                                                                    }
                                                                }
                                                            },
                                                            interaction: {
                                                                mode: 'index',
                                                                intersect: false
                                                            },
                                                            hover: {
                                                                mode: 'index',
                                                                intersect: false
                                                            }
                                                        }}
                                                    />
                                                </Box>
                                            ) : (
                                                <Box sx={{ 
                                                    p: 4, 
                                                    textAlign: 'center',
                                                    color: theme.palette.text.secondary,
                                                    background: 'rgba(255, 255, 255, 0.5)'
                                                }}>
                                                    <Typography variant="body2">
                                                        Waiting for price updates...
                                                    </Typography>
                                                </Box>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                                {watchlist.length === 0 && (
                                    <Box sx={{ 
                                        p: 6, 
                                        textAlign: 'center',
                                        color: theme.palette.text.secondary,
                                        background: 'rgba(255, 255, 255, 0.5)',
                                        borderRadius: 2
                                    }}>
                                        <TrendingUpIcon sx={{ 
                                            fontSize: 48, 
                                            color: theme.palette.grey[300],
                                            mb: 2
                                        }} />
                                        <Typography variant="h6" sx={{ 
                                            color: theme.palette.text.secondary,
                                            fontWeight: 500,
                                            mb: 1
                                        }}>
                                            No stocks in watchlist
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                                            Add stocks to your watchlist to see their price history
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Container>
    </Box>
    );
};

export default StockDashboard;
