import mssqldb from '@/mssqldb';
import FolderRepo from '@/repository/folder.repository';

const folderRepo = new FolderRepo();
interface IFolderData {
	Id: string;
	SortId: number;
	Name: string;
	TypeId: number;
}

(async function injectFolder() {
	// Start Folder Migration *********************************
	const result = await mssqldb.query('SELECT * FROM rd_Folder');
	console.log('info', '------------------------- Start Folder Migration -------------------------');
	if (result.length) {
		for (const data of result[0] as IFolderData[]) {
			const isExistFolder = await folderRepo.get({ where: { name: data?.Name } });
			if (!isExistFolder) {
				await folderRepo.create({ name: data?.Name, index: data?.SortId, typeId: data?.TypeId + 1 });
			} else {
				await folderRepo.update({ index: data?.SortId, typeId: data?.TypeId + 1 }, { where: { id: isExistFolder.id } });
			}
		}
	}
	console.log('info', '------------------------- End Folder Migration -------------------------');
	// End Folder Migration *********************************
})().catch((err) => {
	// eslint-disable-next-line no-console
	console.log('error', err.message);
});
