// Example: Testing Volunteer-to-Volunteer Transfer Feature
// This file demonstrates how to use the transfer endpoint

const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

// Example 1: Volunteer transfers their own stock
async function volunteerSelfTransfer() {
  try {
    const response = await axios.post(
      `${API_URL}/stock/transfer`,
      {
        fromVolunteerId: '507f1f77bcf86cd799439011', // Current volunteer's ID
        toVolunteerId: '507f1f77bcf86cd799439012',   // Target volunteer's ID
        items: [
          {
            itemId: '507f1f77bcf86cd799439013',
            quantity: 50
          },
          {
            itemId: '507f1f77bcf86cd799439014',
            quantity: 30
          }
        ],
        notes: 'Transferring extra supplies to team member in high-need area'
      },
      {
        headers: {
          'Authorization': `Bearer ${VOLUNTEER_TOKEN}`
        }
      }
    );

    console.log('Transfer successful:', response.data);
  } catch (error) {
    console.error('Transfer failed:', error.response?.data || error.message);
  }
}

// Example 2: Admin facilitates transfer between volunteers
async function adminFacilitatedTransfer() {
  try {
    const response = await axios.post(
      `${API_URL}/stock/transfer`,
      {
        fromVolunteerId: '507f1f77bcf86cd799439015',
        toVolunteerId: '507f1f77bcf86cd799439016',
        items: [
          {
            itemId: '507f1f77bcf86cd799439017',
            quantity: 100
          }
        ],
        notes: 'Rebalancing stock across field teams'
      },
      {
        headers: {
          'Authorization': `Bearer ${ADMIN_TOKEN}`
        }
      }
    );

    console.log('Admin transfer successful:', response.data);
  } catch (error) {
    console.error('Admin transfer failed:', error.response?.data || error.message);
  }
}

// Example 3: Check volunteer stock before and after transfer
async function checkStockBeforeAfterTransfer() {
  const volunteerId = '507f1f77bcf86cd799439011';
  
  try {
    // Check stock before
    const beforeResponse = await axios.get(
      `${API_URL}/stock/volunteer/${volunteerId}`,
      {
        headers: {
          'Authorization': `Bearer ${TOKEN}`
        }
      }
    );
    console.log('Stock before transfer:', beforeResponse.data);

    // Perform transfer
    await axios.post(
      `${API_URL}/stock/transfer`,
      {
        fromVolunteerId: volunteerId,
        toVolunteerId: '507f1f77bcf86cd799439012',
        items: [
          {
            itemId: '507f1f77bcf86cd799439013',
            quantity: 20
          }
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${TOKEN}`
        }
      }
    );

    // Check stock after
    const afterResponse = await axios.get(
      `${API_URL}/stock/volunteer/${volunteerId}`,
      {
        headers: {
          'Authorization': `Bearer ${TOKEN}`
        }
      }
    );
    console.log('Stock after transfer:', afterResponse.data);

  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

module.exports = {
  volunteerSelfTransfer,
  adminFacilitatedTransfer,
  checkStockBeforeAfterTransfer
};
