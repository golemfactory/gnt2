import {useContext} from 'react';
import {SnackbarContext} from '../Snackbar/SnackbarProvider';

export const useSnackbar = () => useContext(SnackbarContext);
