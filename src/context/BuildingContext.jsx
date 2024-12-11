import React, { createContext, useState, useEffect, useRef } from 'react';
import { fetchRooms } from '../services/auth/room';
import { message } from 'antd';

export const BuildingContext = createContext();

export const BuildingProvider = ({ children }) => {
  const [buildingData, setBuildingData] = useState([]);
  const [loading, setLoading] = useState(false);
  const abortControllerRef = useRef(null);
  const debounceTimeoutRef = useRef(null);
  const [desc, setDesc] = useState('');

  const fetchBuildingData = async () => {
    if (loading) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setLoading(true);
    try {
      const response = await fetchRooms({ signal: abortController.signal });

      if (response) {
        setBuildingData(response.buildings);
        setDesc(response.description);
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        message.error('Failed to load building data');
        console.error('Error fetching building data:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      fetchBuildingData();
    }, 300);

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const refreshBuildingData = () => {
    fetchBuildingData(); // Trigger a data refresh
  };

  return (
    <BuildingContext.Provider
      value={{ buildingData, loading, desc, refreshBuildingData }}
    >
      {children}
    </BuildingContext.Provider>
  );
};
