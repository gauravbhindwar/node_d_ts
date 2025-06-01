import { coalesce } from '@/_utils/coalesce';
import assert from 'assert';
import Sequelize from 'sequelize';
import {
    Action, SourceType,
} from '../_types/models/AuditLogAttributes';
import {
    cachedAuditingDisablingResolver,
    cachedProcessingActivityResolver,
    cachedRequestResolver,
    cachedSystemResolver,
    cachedUserResolver,
} from './resolvers';

const saveAuditLog = (action: Action, model, options) => {
  if (model.constructor.audited === false || cachedAuditingDisablingResolver() === true) {
    return null;
  }

  // @ts-ignore
  const tx = options.transaction || (Sequelize._cls ? Sequelize._cls.get('transaction') : null);

  // Verify that we're running in a transaction. This helps prevent orphan logs
  assert(tx, `All create/update/delete operations must be run
    in a transaction to prevent orphaned logs or connected models on save.
    Please add a transaction to your current "${action}"" request`);

  const user = cachedUserResolver();

  const Model = model.constructor;
  const table_name = Model.getTableName();

  const request_id = coalesce(
    table_name === 'requests' ? model.get('id') : undefined,
    cachedRequestResolver()?.id,
    model.get('request_id'),
  );
  const system_id = coalesce(
    table_name === 'systems' ? model.get('id') : undefined,
    cachedSystemResolver()?.id,
    model.get('system_id'),
  );
  const processing_activity_id = coalesce(
    table_name === 'processing_activities' ? model.get('id') : undefined,
    cachedProcessingActivityResolver()?.id,
    model.get('processing_activity_id'),
  );

  // This reference to AuditLog avoids circular import issues
  return Model.sequelize.models.AuditLog.create({
    source_type: user ? SourceType.USER : SourceType.SYSTEM,
    source_id: user?.id,
    request_id,
    system_id,
    processing_activity_id,
    table_name,
    table_row_id: `${model.get('id')}`,
    action,
    timestamp: new Date(),
    updated_values: (options.fields || []).reduce((res, c) => ({
      ...res,
      [c]: model[c],
    }), {}),
    previous_values: action === Action.DELETE ? model.toJSON() : model.previous(),
    transaction_id: tx?.id,
  });
};

type RequireFlagsProps = {
  returning?: boolean
  individualHooks?: boolean
};
const requireFlags = (flags: RequireFlagsProps, type: string) => (options, o2) => {
  const opts = o2 || options;
  if (opts.model.constructor.audited === false || cachedAuditingDisablingResolver() === true) {
    return;
  }

  if (flags.returning) {
    assert(opts.returning, `${type} actions must have "returning" set to true
      in order for auditing to work properly. Please adjust accordingly.`);
  }
  if (flags.individualHooks) {
    assert(opts.individualHooks, `${type} actions must have "individualHooks"
      set to true in order for auditing to work properly. Please adjust
      accordingly`);
  }
};

export default function setupAuditing(sequelize) {
  sequelize.addHook('afterCreate', (model, options) => (saveAuditLog(Action.CREATE, model, options)));
  sequelize.addHook('afterUpdate', (model, options) => (saveAuditLog(Action.UPDATE, model, options)));
  sequelize.addHook('afterDestroy', (model, options) => (saveAuditLog(Action.DELETE, model, options)));
  sequelize.addHook('afterBulkCreate', (instances, options) => Promise.all(
    instances.map((instance) => (saveAuditLog(instance._options?.isNewRecord || instance.isNewRecord ? Action.CREATE : Action.UPDATE, instance, options))),
  ));
  sequelize.addHook('beforeBulkCreate', requireFlags({ returning: true }, 'Bulk create'));
  sequelize.addHook('beforeBulkUpdate', requireFlags({ returning: true, individualHooks: true }, 'Bulk update'));
  sequelize.addHook('beforeBulkDestroy', requireFlags({ individualHooks: true }, 'Bulk delete'));
  return sequelize;
}
