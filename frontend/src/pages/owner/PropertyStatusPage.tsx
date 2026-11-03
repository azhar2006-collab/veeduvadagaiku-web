import React from 'react';
import { Navigate } from 'react-router-dom';

export const PropertyStatusPage: React.FC = () => {
  return <Navigate to="/owner/properties" replace />;
};
