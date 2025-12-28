import React, { useState } from 'react';
import { PersonalSection, ContributionsSection, MarketSection } from './CalculatorFormParts';

export default function CalculatorForm(props) {
  // Stan walidacji trzymamy tutaj, bo dotyczy całego formularza
  const [errors, setErrors] = useState({});
  const [warnings, setWarnings] = useState({});

  return (
    <>
      <PersonalSection 
        {...props} 
        errors={errors} setErrors={setErrors} 
      />
      
      <ContributionsSection 
        {...props} 
      />
      
      <MarketSection 
        {...props} 
        warnings={warnings} setWarnings={setWarnings} 
      />
    </>
  );
}