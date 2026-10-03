import { useQuery } from '@tanstack/react-query';
import { propertyService } from '../services/property.service';
import { PropertyFilters } from '../types';

export const useProperties = (filters: PropertyFilters = {}) => {
  return useQuery({
    queryKey: ['properties', filters],
    queryFn: () => propertyService.getProperties(filters),
  });
};

export const useProperty = (id: string) => {
  return useQuery({
    queryKey: ['property', id],
    queryFn: () => propertyService.getPropertyById(id),
    enabled: !!id,
  });
};

export const useLocalities = () => {
  return useQuery({
    queryKey: ['localities'],
    queryFn: () => propertyService.getLocalities(),
    staleTime: 60 * 60 * 1000, // 1 hour cache
  });
};
