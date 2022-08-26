import { NextRouter } from 'next/router';
import React, { useState } from 'react';

type useInputAddressTypeProps = {
  redirectOnResult?: false;
  setInputAddress: React.Dispatch<React.SetStateAction<string>>;
} | {
  redirectOnResult: true;
  router: NextRouter;
};

type useInputAddressType = (props: useInputAddressTypeProps) => [
  isDialogOpen: boolean,
  handleDialogOpen: () => void,
  handleResult: (resultAddress: string) => void,
  handleDialogClose: () => void,
];

const useQRAddressReader: useInputAddressType = (props) => {
  const [ isDialogOpen, setIsDialogOpen ] = useState(false);

  const handleDialogOpen = () => {
    setIsDialogOpen(true);
  };

  const handleResult = (resultAddress: string) => {
    if (props.redirectOnResult) {
      props.router.push({
        pathname: '/send-to-wallet',
        query: { walletAddress: resultAddress },
      }, '/send-to-wallet');
    } else {
      props.setInputAddress(resultAddress);
    }
    handleDialogClose();
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
  };

  return [
    isDialogOpen,
    handleDialogOpen,
    handleResult,
    handleDialogClose,
  ];
};

export default useQRAddressReader;
