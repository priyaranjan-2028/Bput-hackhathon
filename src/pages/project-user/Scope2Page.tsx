import React from 'react';
import ESGDataEntryPage from './ESGDataEntryPage';
import { Scope } from '../../types';

export default function Scope2Page() {
  return <ESGDataEntryPage initialScope={Scope.SCOPE_2} />;
}
