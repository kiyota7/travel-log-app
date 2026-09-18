'use client';

import { Amplify } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';
import { I18n } from 'aws-amplify/utils';
import { translations } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import outputs from '@/amplify_outputs.json';

Amplify.configure(outputs);
I18n.putVocabularies(translations);
I18n.setLanguage('ja');

export default function AppProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Authenticator loginMechanisms={['email']}>
      {children}
    </Authenticator>
  );
}
