module Models {
	export interface ITag {
		name : string;
		paths: string[]
	}
	
	export interface IFolderSettings {
		tags: ITag[]
	}
	
	export class FolderSettings {
		tags : ITag[];
		
		constructor(options? : IFolderSettings) {
			options = options || <any>{};
			
			this.tags = options.tags || [];
		}
	}
}