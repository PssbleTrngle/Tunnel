export type RetryOptions = {
  amount?: number;
  pause?: number;
};

export type RetryContext = {
  attempt: number;
  reset(): void;
};

async function wait(milliseconds: number) {
  await new Promise((res) => setTimeout(res, milliseconds));
}

export default function executeWithRetries<T extends any[]>(
  func: (...args: [...T, RetryContext]) => Promise<void>,
  { amount = 5, pause = 1000 }: RetryOptions = {}
) {
  if (amount <= 0 || amount > 10)
    throw new Error(`invalid value passed to 'attempts': ${amount}`);

  let attempt = 0;
  const reset = () => {
    attempt = 0;
  };

  return async (...args: T) => {
    while (attempt < amount) {
      attempt++;

      try {
        return await func(...args, { attempt, reset });
      } catch (ex) {
        console.error(ex);
        console.error(`trying again in ${pause}ms (${attempt}/${amount})`);
        console.info();
        await wait(pause);
      }
    }

    throw new Error("retry attemps exceeeded");
  };
}
