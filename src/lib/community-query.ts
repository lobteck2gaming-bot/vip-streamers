import { queryOptions } from '@tanstack/react-query';
import { getCommunity } from './community.functions';
export const communityQuery = queryOptions({ queryKey: ['community'], queryFn: () => getCommunity(), staleTime: 30_000 });