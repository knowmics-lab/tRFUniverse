<?php

namespace App\Enums;

enum DimensionalityReductionMethodEnum: string
{
    case PCA = 'pca';
    case MDS = 'mds';
    case ICA = 'ica';
    case TSNE = 'tsne';
    case UMAP = 'umap';
}
