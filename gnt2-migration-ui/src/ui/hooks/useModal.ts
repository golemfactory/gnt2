import {useCallback, useState} from 'react';

export const useModal = (initialMode = false): [boolean, () => void, () => void] => {
  const [isModalVisible, setIsModalVisible] = useState(initialMode);
  const closeModal = useCallback(() => setIsModalVisible(false), []);
  const openModal = useCallback(() => setIsModalVisible(true), []);

  return [isModalVisible, openModal, closeModal];
};
