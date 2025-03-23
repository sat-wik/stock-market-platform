import PriceAlert from '../models/priceAlert.js';
import { Op } from 'sequelize';

export const createAlert = async (req, res) => {
    try {
        const { symbol, targetPrice, condition } = req.body;
        const userId = req.user.id;

        const alert = await PriceAlert.create({
            userId,
            symbol,
            targetPrice,
            condition
        });

        res.status(201).json(alert);
    } catch (error) {
        console.error('Error creating alert:', error);
        res.status(500).json({ error: 'Failed to create alert' });
    }
};

export const getUserAlerts = async (req, res) => {
    try {
        const userId = req.user.id;
        const alerts = await PriceAlert.findAll({
            where: {
                userId,
                active: true
            }
        });

        res.json(alerts);
    } catch (error) {
        console.error('Error fetching alerts:', error);
        res.status(500).json({ error: 'Failed to fetch alerts' });
    }
};

export const deleteAlert = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const alert = await PriceAlert.findOne({
            where: {
                id,
                userId
            }
        });

        if (!alert) {
            return res.status(404).json({ error: 'Alert not found' });
        }

        await alert.update({ active: false });
        res.json({ message: 'Alert deleted successfully' });
    } catch (error) {
        console.error('Error deleting alert:', error);
        res.status(500).json({ error: 'Failed to delete alert' });
    }
};

export const checkAlerts = async (symbol, currentPrice) => {
    try {
        // Find all active alerts for this symbol
        const alerts = await PriceAlert.findAll({
            where: {
                symbol,
                active: true,
                triggered: false,
                [Op.or]: [
                    {
                        condition: 'above',
                        targetPrice: { [Op.lte]: currentPrice }
                    },
                    {
                        condition: 'below',
                        targetPrice: { [Op.gte]: currentPrice }
                    }
                ]
            }
        });

        // Mark alerts as triggered
        for (const alert of alerts) {
            await alert.update({ triggered: true });
        }

        return alerts;
    } catch (error) {
        console.error('Error checking alerts:', error);
        return [];
    }
};
