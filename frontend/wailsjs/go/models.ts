export namespace service {
	
	export class CategoryDTO {
	    id: number;
	    label: string;
	
	    static createFrom(source: any = {}) {
	        return new CategoryDTO(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.label = source["label"];
	    }
	}
	export class ItemDTO {
	    id: number;
	    label: string;
	    imagePath: string;
	
	    static createFrom(source: any = {}) {
	        return new ItemDTO(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.label = source["label"];
	        this.imagePath = source["imagePath"];
	    }
	}
	export class CategoryWithItemsDTO {
	    id: number;
	    label: string;
	    items: ItemDTO[];
	
	    static createFrom(source: any = {}) {
	        return new CategoryWithItemsDTO(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.label = source["label"];
	        this.items = this.convertValues(source["items"], ItemDTO);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	
	export class ItemWithStockDTO {
	    id: number;
	    label: string;
	    categoryId: number;
	    imagePath: string;
	    quantity: number;
	
	    static createFrom(source: any = {}) {
	        return new ItemWithStockDTO(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.label = source["label"];
	        this.categoryId = source["categoryId"];
	        this.imagePath = source["imagePath"];
	        this.quantity = source["quantity"];
	    }
	}
	export class OrderHistoryDTO {
	    id: number;
	    itemId: number;
	    itemLabel: string;
	    quantity: number;
	    unitPrice: number;
	    lineTotal: number;
	    orderedAt: string;
	
	    static createFrom(source: any = {}) {
	        return new OrderHistoryDTO(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.itemId = source["itemId"];
	        this.itemLabel = source["itemLabel"];
	        this.quantity = source["quantity"];
	        this.unitPrice = source["unitPrice"];
	        this.lineTotal = source["lineTotal"];
	        this.orderedAt = source["orderedAt"];
	    }
	}
	export class StockDTO {
	    id: number;
	    itemId: number;
	    quantity: number;
	
	    static createFrom(source: any = {}) {
	        return new StockDTO(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.itemId = source["itemId"];
	        this.quantity = source["quantity"];
	    }
	}

}

