/**
 * @param {Object} obj
 * @param {string} obj.type
 * @param {boolean} obj.allowNull
 * @param {string} fkTableName
 * @param {string} pkColumnName - Default value is "id"
 * @param {string} onDelete - Default value is "set null"
 */

export function attrWithFK(
	obj: { type: string; allowNull: boolean },
	fkTableName: string,
	pkColumnName: string,
	_onDelete: string,
) {
	return {
		...obj,
		...(fkTableName
			? {
					references: {
						model: fkTableName,
						key: pkColumnName || 'id',
					},
					// onDelete: onDelete || 'set null'
			  }
			: {}),
	};
}
