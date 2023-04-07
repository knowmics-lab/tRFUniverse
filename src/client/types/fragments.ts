export interface FragmentPosition {
    id: number;
    chromosome: string;
    start: number;
    end: number;
    strand: "+" | "-";
    aminoacid: string;
    anticodon: string;
}

export interface FragmentBase {
    id: number;
    name: string;
    width: number;
    type: string;
}

export interface Fragment extends FragmentBase {
    synonyms?: string[];
    expressed_in: string[];
    positions: FragmentPosition[];
}

export interface FragmentType {
    id: number;
    name: string;
}
