import { Atom, atom, useAtom } from 'jotai';

const portalTokenAtom = atom<string>('');
const profileTokenAtom = atom<string>('');

interface Token {
  token: string;
  loading: boolean;
}

const useToken = (t: Atom<string>): Token => {
  const [token] = useAtom(t);
  return {
    token,
    loading: token === '',
  };
};

export const useProfileToken = (): Token => useToken(profileTokenAtom);
export const usePortalToken = (): Token => useToken(portalTokenAtom);

interface SetTokens {
  profileToken: string;
  setProfileToken: (value: string) => void;
  portalToken: string;
  setPortalToken: (value: string) => void;
}

export const useSetTokens = (): SetTokens => {
  const [profileToken, setProfileToken] = useAtom(profileTokenAtom);
  const [portalToken, setPortalToken] = useAtom(portalTokenAtom);
  return {
    profileToken,
    setProfileToken,
    portalToken,
    setPortalToken,
  };
};
