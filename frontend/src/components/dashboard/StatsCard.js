import React from 'react';
import { Card, CardContent, Box, Typography } from '@mui/material';

const StatsCard = ({ title, value, icon, color, subtitle, onClick }) => {
  return (
    <Card 
      sx={{ 
        backgroundColor: 'background.paper',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': { 
          transform: 'translateY(-4px)', 
          boxShadow: 6,
          cursor: onClick ? 'pointer' : 'default'
        },
        height: '100%'
      }}
      onClick={onClick}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h4" component="div" color="primary.main" gutterBottom>
              {value}
            </Typography>
            <Typography variant="h6" component="div" color="text.primary">
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box sx={{ color, fontSize: 40 }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default StatsCard;