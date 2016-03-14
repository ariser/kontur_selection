'use strict'

angular.module('matrixCalc')

.factory('matrixCalc', [
  'defaultValueForEmptyCell',
  (defaultValueForEmptyCell) ->
    cellProduct = (matrixA, matrixB, rowIndex, colIndex) ->
      _.reduce(matrixA[rowIndex], (memo, valueA, index) ->
        if not angular.isDefined(valueA)
          valueA = matrixA[rowIndex][index] = defaultValueForEmptyCell

        valueB = matrixB[index][colIndex]
        if not angular.isDefined(valueB)
          valueB = matrixB[index][colIndex] = defaultValueForEmptyCell

        memo + valueA * valueB
      , 0)

    class MatrixCalc
      multiply: (matrixA, matrixB) ->
        cellProduct(matrixA, matrixB, rowIndex, colIndex) for colIndex in [0..matrixB[0].length - 1] for rowIndex in [0..matrixA.length - 1]


    new MatrixCalc
])