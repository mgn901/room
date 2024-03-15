import { type ButtonHTMLAttributes, type FC, type HTMLAttributes } from 'react';
import { type TPrimitive } from '../../../utils/primitives/TPrimitive.ts';

type TEventHandlerAttributesOf<
  A extends HTMLAttributes<T>,
  T = A extends HTMLAttributes<infer U> ? U : never,
> = {
  [k in keyof A as A[k] extends ((...args: never) => unknown) | undefined ? k : never]: A[k];
};

type TEventHandlerWithKey<
  A extends HTMLAttributes<T>,
  K extends keyof TEventHandlerAttributesOf<A>,
  T = A extends HTMLAttributes<infer U> ? U : never,
> =
  | ((
      keys: TPrimitive[],
      ...args: NonNullable<A>[K] extends infer U
        ? U extends (...args: never) => unknown
          ? Parameters<U>
          : never
        : never
    ) => void)
  | undefined;

type TEventHandlerWithKeyAttributesOf<
  A extends HTMLAttributes<T>,
  T = A extends HTMLAttributes<infer U> ? U : never,
> = {
  [k in keyof TEventHandlerAttributesOf<A>]: TEventHandlerWithKey<A, k>;
};

type TWrappedElementAttributesOf<
  A extends HTMLAttributes<T>,
  T = A extends HTMLAttributes<infer U> ? U : never,
> = Omit<A, keyof TEventHandlerAttributesOf<A>> & TEventHandlerWithKeyAttributesOf<A>;

const generatePropsForUnderlyingElement = <
  A extends HTMLAttributes<T>,
  T = A extends HTMLAttributes<infer U> ? U : never,
>(
  props: TWrappedElementAttributesOf<A> & {
    keys: TPrimitive[];
  },
) =>
  Object.fromEntries(
    Object.entries(props).map(([key, value]) => [
      key,
      typeof value === 'function'
        ? (...args: unknown[]) => {
            (value as (keys: TPrimitive[], ...args: unknown[]) => unknown)(props.keys, ...args);
          }
        : value,
    ]),
  );

export const Button: FC<
  TWrappedElementAttributesOf<ButtonHTMLAttributes<HTMLButtonElement>> & {
    keys: TPrimitive[];
  }
> = (props) => {
  const newProps = generatePropsForUnderlyingElement(props);
  return (
    // biome-ignore lint/a11y/useButtonType:
    <button {...newProps}>{props.children}</button>
  );
};
