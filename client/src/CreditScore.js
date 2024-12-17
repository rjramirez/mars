// src/CreditScore.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, Button, Modal, TextField, Box, Snackbar, Alert 
} from '@mui/material';

function CreditScore() {
  const [creditScores, setCreditScores] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [modalType, setModalType] = useState('add'); // 'add' or 'update'
  const [score, setScore] = useState('');
  const [userId, setUserId] = useState('');
  const [updateId, setUpdateId] = useState(null);
  const [updateScore, setUpdateScore] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  // Fetch credit scores from the API
  useEffect(() => {
    axios.get('http://localhost:3000/creditscores')
      .then(response => {
        setCreditScores(response.data.creditScores);
      })
      .catch(error => {
        console.error('Error fetching credit scores:', error);
      });
  }, []);

  // Open modal for add or update
  const handleOpenModal = (type, id = null, score = '') => {
    setModalType(type);
    setUpdateId(id);
    setScore(type === 'update' ? score : '');
    setUserId('');
    setOpenModal(true);
  };

  // Close modal
  const handleCloseModal = () => setOpenModal(false);

  // Add a new credit score
  const addCreditScore = () => {
    axios.post('http://localhost:3000/creditscores', { score, user_id: userId })
      .then(response => {
        setCreditScores([...creditScores, response.data]);
        setSnackbarMessage('Credit score added successfully!');
        setSnackbarSeverity('success');
        setOpenSnackbar(true);
        handleCloseModal();
      })
      .catch(error => {
        setSnackbarMessage('Error adding credit score.');
        setSnackbarSeverity('error');
        setOpenSnackbar(true);
        console.error('Error adding credit score:', error);
      });
  };

  // Update an existing credit score
  const updateCreditScore = () => {
    axios.put(`http://localhost:3000/creditscores/${updateId}`, { score: updateScore })
      .then(response => {
        const updatedScores = creditScores.map(item =>
          item.id === updateId ? { ...item, score: updateScore } : item
        );
        setCreditScores(updatedScores);
        setSnackbarMessage('Credit score updated successfully!');
        setSnackbarSeverity('success');
        setOpenSnackbar(true);
        handleCloseModal();
      })
      .catch(error => {
        setSnackbarMessage('Error updating credit score.');
        setSnackbarSeverity('error');
        setOpenSnackbar(true);
        console.error('Error updating credit score:', error);
      });
  };

  // Delete a credit score
  const deleteCreditScore = (id) => {
    axios.delete(`http://localhost:3000/creditscores/${id}`)
      .then(response => {
        setCreditScores(creditScores.filter(item => item.id !== id));
        setSnackbarMessage('Credit score deleted successfully!');
        setSnackbarSeverity('success');
        setOpenSnackbar(true);
      })
      .catch(error => {
        setSnackbarMessage('Error deleting credit score.');
        setSnackbarSeverity('error');
        setOpenSnackbar(true);
        console.error('Error deleting credit score:', error);
      });
  };

  return (
    <div>
      <h1>Credit Score Management</h1>

      {/* Display the credit scores in a table */}
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Score</TableCell>
              <TableCell>User ID</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {creditScores.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.score}</TableCell>
                <TableCell>{item.user_id}</TableCell>
                <TableCell align="right">
                  <Button
                    variant="outlined"
                    onClick={() => handleOpenModal('update', item.id, item.score)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => deleteCreditScore(item.id)}
                    sx={{ ml: 2 }}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Button to add new credit score */}
      <Button
        variant="contained"
        onClick={() => handleOpenModal('add')}
        sx={{ mt: 3 }}
      >
        Add New Credit Score
      </Button>

      {/* Modal for adding/updating credit scores */}
      <Modal open={openModal} onClose={handleCloseModal}>
        <Box sx={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: 400, bgcolor: 'background.paper', padding: 4, borderRadius: 2, boxShadow: 24
        }}>
          <h2>{modalType === 'add' ? 'Add New Credit Score' : 'Update Credit Score'}</h2>
          <TextField
            label="Score"
            type="number"
            fullWidth
            variant="outlined"
            value={modalType === 'add' ? score : updateScore}
            onChange={(e) => modalType === 'add' ? setScore(e.target.value) : setUpdateScore(e.target.value)}
            sx={{ mb: 2 }}
          />
          {modalType === 'add' && (
            <TextField
              label="User ID"
              type="number"
              fullWidth
              variant="outlined"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              sx={{ mb: 2 }}
            />
          )}
          <Button
            variant="contained"
            onClick={modalType === 'add' ? addCreditScore : updateCreditScore}
            fullWidth
          >
            {modalType === 'add' ? 'Add Credit Score' : 'Update Credit Score'}
          </Button>
        </Box>
      </Modal>

      {/* Snackbar for success/error messages */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert onClose={() => setOpenSnackbar(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default CreditScore;
