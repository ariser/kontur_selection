'use strict'

angular.module('matrixCalc')

.factory('matrixCalc', ->
  cellProduct = (matrixA, matrixB, rowIndex, colIndex) ->
    _.reduce(matrixA[rowIndex],
      (memo, valueA, index) -> memo + valueA * matrixB[index][colIndex]
    , 0)

  class MatrixCalc
    multiply: (matrixA, matrixB) ->
      cellProduct(matrixA, matrixB, rowIndex, colIndex) for colIndex in [0..matrixB[0].length - 1] for rowIndex in [0..matrixA.length - 1]


  new MatrixCalc
)