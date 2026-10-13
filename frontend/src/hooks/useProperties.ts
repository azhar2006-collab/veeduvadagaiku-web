import { useQuery } from '@tanstack/react-query';
import { propertyService } from '../services/property.service';
import { PropertyFilters } from '../types';
import { CHENNAI_LOCALITIES } from '../utils/chennaiLocalities';

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
  return useQuery<string[]>({
    queryKey: ['localities'],
    queryFn: async () => {
      try {
        const res = await propertyService.getLocalities();
        const data = res?.data;
        if (Array.isArray(data) && data.length > 0) {
          // Normalize any en-dash to hyphen
          return data.map((item) => item.replace(/\s*–\s*/g, ' - '));
        }
      } catch (err) {
        console.warn('Using local CHENNAI_LOCALITIES fallback:', err);
      }
      return CHENNAI_LOCALITIES;
    },
    initialData: CHENNAI_LOCALITIES,
    staleTime: 60 * 60 * 1000,
  });
};
