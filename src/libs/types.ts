import { CHANNEL_INJECTS, CUSTOMER_TYPES } from './constants.ts';

export type CustomerType = (typeof CUSTOMER_TYPES)[number];
export type ChannelInject = (typeof CHANNEL_INJECTS)[number];

export type CustomerFlags = {
  isAgreedTermsConditions: boolean;
  isCompleted: boolean;
  isSubsidy: boolean;
  isRecommendationLetter: boolean;
  isBlocked: boolean;
  isBusinessType: boolean;
  isBusinessName: boolean;
};

export type Success<T> = {
  data: T;
  error: null;
};

export type Failure<E> = {
  data: null;
  error: E;
};

export type Result<T, E = Error> = Success<T> | Failure<E>;
