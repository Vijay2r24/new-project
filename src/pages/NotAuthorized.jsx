import { useTranslation } from 'react-i18next';
export default function NotAuthorized() {
  const { t } = useTranslation();
  return <div style={{padding: 40, textAlign: 'center', color: 'red', fontWeight: 'bold'}}>{t('NOT_AUTHORIZED.MESSAGE')}</div>;
} 