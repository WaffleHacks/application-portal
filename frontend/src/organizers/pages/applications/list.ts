import { ReducedApplication } from '../../../store';
import { Order } from '../../components/table';

enum SortKey {
  Name,
  Email,
  Country,
  AppliedAt,
}

const getKey = (app: ReducedApplication, key: SortKey): string => {
  switch (key) {
    case SortKey.Name:
      return `${app.participant.first_name} ${app.participant.last_name}`;
    case SortKey.Email:
      return app.participant.email;
    case SortKey.Country:
      return app.country;
    case SortKey.AppliedAt:
      return app.created_at;
  }
};

// Handle sorting applications by a key with a given order
const sort =
  (by: SortKey, order: Order) =>
  (a: ReducedApplication, b: ReducedApplication): number => {
    const keyA = getKey(a, by);
    const keyB = getKey(b, by);

    if (keyA === keyB) return 0;

    // Different handling for times
    if (by === SortKey.AppliedAt) {
      if (keyA > keyB) return order === Order.Descending ? -1 : 1;
      else return order === Order.Descending ? 1 : -1;
    } else {
      if (keyA > keyB) return order === Order.Descending ? 1 : -1;
      else return order === Order.Descending ? -1 : 1;
    }
  };

export { SortKey, sort };
