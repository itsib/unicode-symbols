import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { SYMBOLS } from '../constants/symbols';

export function useIconGroupId(): string | undefined {
  const navigate = useNavigate();
  const iconGroupId = useParams().iconGroupId as string | undefined;

  // Save and restore page id
  useEffect(() => {
    if (iconGroupId) {
      localStorage.setItem('last-page-id', iconGroupId);
      return;
    }
    const lastPageId = localStorage.getItem('last-page-id') || SYMBOLS[0].id;
    navigate(`/unicode/${lastPageId}`, { replace: true })
  }, [iconGroupId, navigate]);

  return iconGroupId;
}