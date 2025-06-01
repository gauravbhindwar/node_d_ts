/* eslint-disable import/no-mutable-exports */

export let cachedUserResolver = () => (null);
export const setUserResolver = (resolver) => {
  cachedUserResolver = resolver;
};

export let cachedOrganizationResolver = () => (null);
export const setOrganizationResolver = (resolver) => {
  cachedOrganizationResolver = resolver;
};

export let cachedAuditingDisablingResolver = () => (false);
export const setAuditingDisablingResolver = (resolver) => {
  cachedAuditingDisablingResolver = resolver;
};

export let cachedRequestResolver = () => (null);
export const setRequestResolver = (resolver) => {
  cachedRequestResolver = resolver;
};

export let cachedSystemResolver = () => (null);
export const setSystemResolver = (resolver) => {
  cachedSystemResolver = resolver;
};

export let cachedProcessingActivityResolver = () => (null);
export const setProcessingActivityResolver = (resolver) => {
  cachedProcessingActivityResolver = resolver;
};
