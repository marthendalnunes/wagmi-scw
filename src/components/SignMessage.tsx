import { useCallback, useEffect, useMemo, useState } from "react";
import type { Hex } from "viem";
import { parseErc6492Signature, isErc6492Signature } from "viem/experimental";
import { useAccount, usePublicClient, useSignMessage, useSwitchChain } from "wagmi";
import { SiweMessage } from "siwe";
import { mainnet, base, baseSepolia } from "wagmi/chains";

export function SignMessage() {
  const account = useAccount();
  const client = usePublicClient();
  const { switchChain } = useSwitchChain();
  const [parsedSignature, setParsedSignature] = useState<any>(undefined);
  const [isErc6492SignatureResponse, setIsErc6492SignatureResponse] = useState<boolean>();
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
    const isErc6492SignatureResponse = isErc6492Signature(signature);
    setParsedSignature(parsedSignature);
    setIsErc6492SignatureResponse(isErc6492SignatureResponse);

  }, [signature, account]);

  return (
    <div>
      <h2>Sign Message (Sign In with Ethereum)</h2>
      <div>
        <button
          onClick={() => switchChain({ chainId: mainnet.id })}
        >Switch network to Ethereum</button>
        <button
          onClick={() => switchChain({ chainId: base.id })}
        >Switch network to Base</button>
        <button
          onClick={() => switchChain({ chainId: baseSepolia.id })}
        >Switch network to Base Sepolia</button>
      </div>
      <button
        onClick={() => signMessage({ message: message.prepareMessage() })}
      >
        Sign
      </button>
      <p>{ }</p>
      {signature && <p>Signature: {signature}</p>}
      {valid != undefined && <p> Is valid: {valid.toString()} </p>}
      {parsedSignature && <p> Parsed Signature: <pre>{JSON.stringify(parsedSignature, null, 2)}</pre> </p>}
      {typeof isErc6492SignatureResponse === "boolean" && <p> Is ERC6492 Signature: {isErc6492SignatureResponse.toString()} </p>}
    </div>
  );
}
