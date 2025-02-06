import React from 'react';
import { Link } from 'react-router-dom';
import styles from './NotFound.module.css';

/**
 * NotFound component displays a 404 error page with formatted date/time and user information
 * @returns {JSX.Element}
 */
function NotFound() {
  const getCurrentUTCDateTime = () => {
    const now = new Date();
    return now
      .toISOString()
      .replace('T', ' ')
      .replace(/\.\d{3}Z$/, '');
  };

  const getUserLogin = () => {
    return (
      localStorage.getItem('userLogin') ||
      sessionStorage.getItem('userLogin') ||
      'Not logged in'
    );
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.errorCode}>404</h1>
      <h2 className={styles.title}>Page Not Found</h2>
      <p className={styles.message}>
        The page you are looking for might have been removed, had its name
        changed, or is temporarily unavailable.
      </p>

      <Link to="/home" className={styles.homeButton}>
        Go to Homepage
      </Link>

      <div className={styles.info}>
        <div className={styles.infoItem}>
          <span className={styles.label}>
            Current Date and Time (UTC - YYYY-MM-DD HH:MM:SS formatted):
          </span>
          {getCurrentUTCDateTime()}
        </div>
        <div className={styles.infoItem}>
          <span className={styles.label}>Current User's Login:</span>
          {getUserLogin()}
        </div>
      </div>
    </div>
  );
}

export default NotFound;
