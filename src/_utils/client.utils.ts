import { Client } from '../_models/Client';

export const transformClientResult = (user: Client, extraAttributes?: any) => {
  // NOTE We get the first user_organization specified in the list, because
  // we assume that the UserService returned only the user_org that
  // represents the current organization+user
  const { user_organizations: [user_organization] }: any = user;
  const plain = user.get({ plain: true });
  return {
    ...plain,
    organization_id: user_organization.organization_id,
    organization: user_organization.organization,
    role_id: user_organization.role_id,
    role: user_organization.role,
    ...(extraAttributes || {}),
  } as Client;
};
