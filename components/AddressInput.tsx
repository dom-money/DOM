import React from 'react';
import styled from 'styled-components';

import GenericContainer from './GenericContainer';
import IconButton from './IconButton';
import ContactsIcon from '../styles/icons/ContactsIcon';
import ScanQRIcon from '../styles/icons/ScanQRIcon';

interface AddressInputProps {
  /**
   * Label text
   */
  label: string;
  /**
   * Address value (input's state)
   */
  addressValue: string;
  /**
   * HTML <input> id Attribute
   */
  inputID: string;
  /**
   * Input on value change handler function
   */
  onValueChange?: (addressValue: string) => void;
  /**
   * Input on focus handler function
   */
  onFocus?: (addressValue: string) => void;
  /**
   * Optional string to be used as a mask
   */
  mask?: string;
  /**
   * 'Get Contact' Button Click handler
   */
  getContactOnClick?: () => void;
  /**
   * 'Scan QR' Button Click handler
   */
  scanQROnClick?: () => void;
};

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.625rem;
  position: relative;
`;

const InputWrapper = styled.div`
  position: relative;
  width: 100%;
  overflow: scroll;
  &::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;
`;

const TextInput = styled.input`
  font-family: ${(props) => props.theme.fontFamilyMono};
  font-style: normal;
  font-weight: 400;
  font-size: 1rem;
  border: none;
  background-color: transparent;
  width: 42ch;
  min-width: 100%;
  display: inline-block;
  padding: 0;
  margin-block-start: 0px;
  margin-block-end: 0px;
  color: #FFFFFF;

  &:focus-visible {
    outline: none;
  };
`;

const MaskContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  pointer-events: none;
  user-select: none;
`;

const Mask = styled.span`
  font-family: ${(props) => props.theme.fontFamilyMono};
  font-style: normal;
  font-weight: 400;
  font-size: 1rem;
  color: #F8F8F8;
  opacity: 0.3;
`;

const IconContainer = styled.div`
  display: flex;
  gap: 0.625rem;
`;

const MaskHidden = styled(Mask)`
  visibility: hidden;
`;

const AddressInput = ({
  label,
  addressValue,
  inputID,
  onValueChange,
  onFocus,
  mask = '0xXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
  getContactOnClick,
  scanQROnClick,
}: AddressInputProps) => {
  const maskToDisplay = mask.slice(addressValue.length);

  // eslint-disable-next-line max-len
  const allowedValuePattern = /^(?:0|0x|0x[\da-f]{1,40}|0x0x[\da-f]{1,40})$/i;

  const isAddressValueAllowed = (addressValue: string) => {
  // Checking if address value matches the pattern
    if (allowedValuePattern.test(addressValue)) {
      return true;
    };
    // Checking if address value is empty
    if (addressValue.length === 0) {
      return true;
    };
  };

  const handleInputOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetAddressValue = e.target.value;
    // Checking if there's an onValueChange handler passed via props
    if (!onValueChange) {
      return;
    }
    // Checking if new value is allowed
    if (!isAddressValueAllowed(targetAddressValue)) {
      return;
    }
    // Handling the case when user pasted address on
    // top of '0x' value added by onFocus()
    if (/^0x0x[\da-f]{1,40}$/i.test(targetAddressValue)) {
      onValueChange(targetAddressValue.slice(2));
      return;
    };
    onValueChange(targetAddressValue);
  };

  const handleInputOnFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // Checking if there's an onFocus handler passed via props
    if (!onFocus) {
      return;
    }
    // If address input is empty -> setting it to 2 default mask characters
    if (e.target.value.length > 0) {
      return;
    };
    onFocus(mask.slice(0, 2));
  };

  return (
    <GenericContainer
      label={label}
      titleHtmlElement='label'
      inputID={inputID}
      content={
        <Container>
          <InputWrapper>
            <TextInput
              autoFocus
              autoComplete='off'
              id={inputID}
              spellCheck={false}
              value={addressValue}
              onChange={handleInputOnChange}
              onFocus={handleInputOnFocus}
            />
            <MaskContainer>
              <MaskHidden>{addressValue}</MaskHidden>
              <Mask>{maskToDisplay}</Mask>
            </MaskContainer>
          </InputWrapper>
          <IconContainer>
            <IconButton
              size='large'
              backgroundColor='#020202'
              ariaLabel='Get Contact'
              onClick={getContactOnClick}
            >
              <ContactsIcon color='#ffffff' />
            </IconButton>
            <IconButton
              size='large'
              backgroundColor='#020202'
              ariaLabel='Scan QR'
              onClick={scanQROnClick}
            >
              <ScanQRIcon color='#ffffff' />
            </IconButton>
          </IconContainer>
        </Container>
      }
    />
  );
};

export default AddressInput;