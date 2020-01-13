import React from 'react';
import styled from 'styled-components';

interface SnackbarProps {
  content: string;
  visible: boolean;
}

export const Snackbar = ({content, visible}: SnackbarProps) => {
  if (!visible) return null;

  return (
    <Bar xxx={!visible}>
      {content}
    </Bar>
  );
};


const Bar = styled.div<{xxx: boolean}>`
  background-color: #E40046;
  color: white;
  position: absolute;
  top: 30px;
  right: 30px;
  z-index: 999;
  padding: 8px;
  border-radius: 8px;
`;
