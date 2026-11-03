import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { enquiryService } from '../services/enquiry.service';
import { useAuth } from './useAuth';
import toast from 'react-hot-toast';

export const useUserEnquiries = () => {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['userEnquiries'],
    queryFn: () => enquiryService.getUserEnquiries(),
    enabled: isAuthenticated,
  });
};

export const useOwnerEnquiries = () => {
  const { isOwner } = useAuth();
  return useQuery({
    queryKey: ['ownerEnquiries'],
    queryFn: () => enquiryService.getOwnerEnquiries(),
    enabled: isOwner,
  });
};

export const useCreateEnquiry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ propertyId, message, phone }: { propertyId: string; message: string; phone?: string }) =>
      enquiryService.createEnquiry(propertyId, message, phone),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userEnquiries'] });
      toast.success('Enquiry sent successfully! The owner will contact you.');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Failed to send enquiry';
      toast.error(msg);
    },
  });
};
