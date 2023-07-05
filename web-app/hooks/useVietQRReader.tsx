import { useState } from 'react';
import { useRouter } from 'next/router';
import { QRPay } from 'vietnam-qr-pay';
import { useAuthContext } from '@/context/AuthContext';
import backendClient from '@/lib/axios';

type UseVietQRReader = () => [
  isDialogOpen: boolean,
  handleDialogOpen: () => void,
  handleResult: (vietQR: QRPay, qrData: string) => void,
  handleDialogClose: () => void,
  isCreatingOrder: boolean,
];

const useVietQRReader: UseVietQRReader = () => {
  const [ isDialogOpen, setIsDialogOpen ] = useState(false);
  const [ isCreatingOrder, setIsCreatingOrder ] = useState(false);
  const { user } = useAuthContext();

  const router = useRouter();

  const handleDialogOpen = () => {
    setIsDialogOpen(true);
  };

  const handleResult = async (vietQR: QRPay, qrData: string) => {
    if (!user) return;

    try {
      setIsCreatingOrder(true);
      const { data } = await backendClient({
        url: '/orders',
        method: 'post',
        data: { qr_data: qrData },
        headers: {
          Authorization: `Bearer ${user.idToken}`,
        },
      });

      router.push(`/orders/${data.order.id}`);
    } catch (error) {
      console.log(error);
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
  };

  return [
    isDialogOpen,
    handleDialogOpen,
    handleResult,
    handleDialogClose,
    isCreatingOrder,
  ];
};

export default useVietQRReader;
