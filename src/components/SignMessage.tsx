import { useCallback, useEffect, useMemo, useState } from "react";
import type { Hex } from "viem";
import { parseErc6492Signature } from "viem/experimental";
import { useAccount, usePublicClient, useSignMessage } from "wagmi";
import { SiweMessage } from "siwe";

export function SignMessage() {
  const account = useAccount();
  const client = usePublicClient();
  const [signature, setSignature] = useState<Hex | undefined>(undefined);
  const { signMessage } = useSignMessage({
    mutation: { onSuccess: (sig) => setSignature(sig) },
  });
  const message = useMemo(() => {
    return new SiweMessage({
      domain: document.location.host,
      address: account.address,
      chainId: account.chainId,
      uri: document.location.origin,
      version: "1",
      statement: "Smart Wallet SIWE Example",
      nonce: "12345678",
    });
  }, []);

  const [valid, setValid] = useState<boolean | undefined>(undefined);

  const checkValid = useCallback(async () => {
    if (!signature || !account.address || !client) return;


    client
      .verifyMessage({
        address: account.address,
        message: message.prepareMessage(),
        signature,
      })
      .then((v) => setValid(v));
  }, [signature, account]);

  useEffect(() => {
    checkValid();
    if (!signature) return

    const parsedSignature = parseErc6492Signature(signature);
    console.log({ parsedSignature })

  }, [signature, account]);

  return (
    <div>
      <h2>Sign Message (Sign In with Ethereum)</h2>
      <button
        onClick={() => signMessage({ message: message.prepareMessage() })}
      >
        Sign
      </button>
      <p>{ }</p>
      {signature && <p>Signature: {signature}</p>}
      {valid != undefined && <p> Is valid: {valid.toString()} </p>}
    </div>
  );
}
