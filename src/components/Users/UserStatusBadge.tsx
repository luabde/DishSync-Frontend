import { StatusBadge } from '../common/StatusBadge';

type UserStatus = 'ACTIU' | 'INACTIU';

export function UserStatusBadge({ status }: { status: UserStatus }) {
  return <StatusBadge status={status} />;
}
