import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    List,
    ListItem,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Snackbar,
    Alert
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import axios from 'axios';

const PriceAlerts = ({ symbol }) => {
    const [alerts, setAlerts] = useState([]);
    const [open, setOpen] = useState(false);
    const [targetPrice, setTargetPrice] = useState('');
    const [condition, setCondition] = useState('above');
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    useEffect(() => {
        fetchAlerts();
    }, []);

    const fetchAlerts = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/alerts`);
            setAlerts(response.data);
        } catch (error) {
            console.error('Error fetching alerts:', error);
            showSnackbar('Failed to fetch alerts', 'error');
        }
    };

    const handleCreateAlert = async () => {
        try {
            await axios.post(`${process.env.REACT_APP_API_URL}/api/alerts`, {
                symbol,
                targetPrice: parseFloat(targetPrice),
                condition
            });
            fetchAlerts();
            setOpen(false);
            showSnackbar('Alert created successfully', 'success');
        } catch (error) {
            console.error('Error creating alert:', error);
            showSnackbar('Failed to create alert', 'error');
        }
    };

    const handleDeleteAlert = async (id) => {
        try {
            await axios.delete(`${process.env.REACT_APP_API_URL}/api/alerts/${id}`);
            fetchAlerts();
            showSnackbar('Alert deleted successfully', 'success');
        } catch (error) {
            console.error('Error deleting alert:', error);
            showSnackbar('Failed to delete alert', 'error');
        }
    };

    const showSnackbar = (message, severity) => {
        setSnackbar({ open: true, message, severity });
    };

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Price Alerts</Typography>
                <Button
                    startIcon={<AddIcon />}
                    variant="contained"
                    onClick={() => setOpen(true)}
                >
                    Add Alert
                </Button>
            </Box>

            <List>
                {alerts.map((alert) => (
                    <ListItem
                        key={alert.id}
                        secondaryAction={
                            <IconButton edge="end" onClick={() => handleDeleteAlert(alert.id)}>
                                <DeleteIcon />
                            </IconButton>
                        }
                    >
                        <Typography>
                            {alert.symbol} {alert.condition} {alert.targetPrice}
                            {alert.triggered && ' (Triggered)'}
                        </Typography>
                    </ListItem>
                ))}
            </List>

            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>Create Price Alert</DialogTitle>
                <DialogContent>
                    <Box mt={2}>
                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>Condition</InputLabel>
                            <Select
                                value={condition}
                                label="Condition"
                                onChange={(e) => setCondition(e.target.value)}
                            >
                                <MenuItem value="above">Above</MenuItem>
                                <MenuItem value="below">Below</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField
                            fullWidth
                            label="Target Price"
                            type="number"
                            value={targetPrice}
                            onChange={(e) => setTargetPrice(e.target.value)}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleCreateAlert} variant="contained">
                        Create
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default PriceAlerts;
