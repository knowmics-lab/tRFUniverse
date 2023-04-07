<!DOCTYPE html>
<html lang="en">
    <head>
        <meta http-equiv="Content-Type" content="text/html;charset=utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="user-scalable=no, width=device-width, initial-scale=1, maximum-scale=1">
        <title>Morpheus</title>
        <link rel="stylesheet" href="https://software.broadinstitute.org/morpheus/css/morpheus-latest.min.css">
        <link rel="shortcut icon" href="https://software.broadinstitute.org/morpheus/favicon.ico" type="image/x-icon">
        <script type="text/javascript"
                src="https://software.broadinstitute.org/morpheus/js/morpheus-external-latest.min.js"></script>
        <script src="https://software.broadinstitute.org/morpheus/js/morpheus-latest.min.js"></script>
    </head>
    <body>
        <noscript>
            <p>Please enable JavaScript</p>
        </noscript>
        <div id="vis"></div>
        <script type="text/javascript">
          const toDendrogram = function (rootNode) {
            let counter = 0;
            const leafNodes = [];

            function visit (node) {
              const children = node.children;
              if (children !== undefined) {
                const left = children[0];
                const right = children[1];
                left.parent = node;
                right.parent = node;
                visit(left);
                visit(right);
              } else { // leaf node
                node.minIndex = counter;
                node.maxIndex = counter;
                node.index = counter;
                leafNodes.push(node);
                counter++;
              }
            }

            visit(rootNode);
            morpheus.DendrogramUtil.setNodeDepths(rootNode);
            morpheus.DendrogramUtil.setIndices(rootNode);
            return {
              maxHeight: rootNode.height,
              rootNode: rootNode,
              leafNodes: leafNodes,
              nLeafNodes: leafNodes.length,
            };
          };
          const data = @json($data, JSON_THROW_ON_ERROR);
          if (data.columnDendrogram != null) {
            data.columnDendrogram = toDendrogram(data.columnDendrogram);
          }
          if (data.rowDendrogram != null) {
            data.rowDendrogram = toDendrogram(data.rowDendrogram);
          }
          const { rowDendrogram, columnDendrogram, options } = data;
          const el = $('#vis');
          const allOptions = {
            ...options,
            el,
            columnDendrogramField: null,
            columnDendrogram,
            rowDendrogramField: null,
            rowDendrogram,
            dataset: morpheus.Dataset.fromJSON(options.dataset),
          };
          el.heatmap = new morpheus.HeatMap(allOptions);
        </script>
    </body>
</html>
