import React from 'react';
import styled from 'styled-components';
import { NumericFormat } from 'react-number-format';

import GenericContainer from './GenericContainer';

interface AmountInputProps {
  /**
   * Label text
   */
  label: string;
  /**
   * Amount as a string (when using state)
   */
  amount?: string;
  /**
   * Number of max allowed decimals
   */
  maxDecimals?: number;
  /**
   * Should fixed number of decimals be always displayed?
   */
  fixedDecimalScale?: boolean;
  /**
   * HTML \<input\> id Attribute
   */
  inputID: string;
  /**
   * Input on change handler function (when using state)
   */
  onInputChange?: ({ formattedValue, value }: onInputChangeType) => void;
  /**
   * Optional validation error message
   */
  errorMessage?: string;
  /**
   * Optional autofocus prop
   */
  autoFocus?: boolean;
  /**
   * Is input disabled?
   */
  disabled?: boolean;
};

export type onInputChangeType = {
  formattedValue: string;
  value: string;
};

const Container = styled.div`
  display: flex;
  position: relative;
  font-size: 1rem;
  font-style: normal;
  font-weight: 400;
`;

const CurrencySymbol = styled.h3`
  font-style: normal;
  font-weight: 400;
  font-size: 1.125rem;
  margin-block-start: 0px;
  margin-block-end: 0px;
  color: #FFFFFF;
  position: relative;
  top: 7px;
  opacity: 0.7;
  flex-shrink: 0;
`;

const TextInput = styled.input`
  font-style: normal;
  font-weight: 400;
  font-size: 2.5rem;
  width: 100%;
  border: none;
  background-color: transparent;
  margin-left: 1px;
  padding: 0;
  margin-block-start: 0px;
  margin-block-end: 0px;
  color: #FFFFFF;

  &:focus-visible {
    outline: none;
  };

  &::placeholder {
    color: #F8F8F8;
    opacity: 0.3;
  }
`;

const ErrorMessageDisplay = styled.p<{isError: boolean}>`
  position: absolute;
  background-color: ${(props) => props.theme.colors.error};
  color: #F8F8F8;
  text-align: center;
  margin: 0;
  top: -1.25rem;
  left: -1.25rem;
  right: -1.25rem;
  width: auto;
  height: 0;
  overflow: hidden;
  transition: height 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
  ${(props) => props.isError && `height: 19.5px`};
`;

const AmountInput = ({
  label,
  amount,
  maxDecimals = 2,
  fixedDecimalScale = true,
  inputID,
  onInputChange,
  errorMessage = '',
  autoFocus = true,
  disabled,
}: AmountInputProps) => {
  return (
    <GenericContainer
      label={ label }
      titleHtmlElement='label'
      inputID={ inputID }
      content={
        <Container>
          <ErrorMessageDisplay isError={ errorMessage.length > 0 }>
            { errorMessage }
          </ErrorMessageDisplay>
          <CurrencySymbol>$</CurrencySymbol>
          <NumericFormat
            autoFocus={ autoFocus }
            id={ inputID }
            inputMode='decimal'
            value={ amount }
            thousandSeparator={ true }
            decimalScale={ maxDecimals }
            fixedDecimalScale={ fixedDecimalScale }
            allowNegative={ false }
            placeholder='0'
            allowedDecimalSeparators={ [ '.', ',' ] }
            customInput={ TextInput }
            onValueChange={ onInputChange }
            disabled={ disabled }
          />
        </Container>
      }
    />
  );
};

export default AmountInput;
