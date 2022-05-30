import { useCallback, useState } from 'react';

export enum Order {
  Ascending,
  Descending,
}

type SortFunction<Key, Type> = (key: Key, order: Order) => (a: Type, b: Type) => number;

interface SortingParams<Key, Type> {
  sorted: Type[];
  onClick: (key: Key) => () => void;
  currentKey: Key;
  currentOrder: Order;
}

export const useSorting = <Key, Type>(
  items: Type[],
  sort: SortFunction<Key, Type>,
  defaultKey: Key,
  defaultOrder: Order = Order.Descending,
): SortingParams<Key, Type> => {
  const [by, setBy] = useState(defaultKey);
  const [order, setOrder] = useState(defaultOrder);

  const onClick = useCallback(
    (key: Key) => () => {
      if (by !== key) setOrder(Order.Descending);
      else setOrder(order == Order.Descending ? Order.Ascending : Order.Descending);

      setBy(key);
    },
    [by, order],
  );

  const sorted = items.slice().sort(sort(by, order));
  return { sorted, onClick, currentKey: by, currentOrder: order };
};
