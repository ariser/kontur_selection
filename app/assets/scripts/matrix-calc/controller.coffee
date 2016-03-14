'use strict'

angular.module('matrixCalc')

.controller('matrixCalcCtrl', [
  '$scope', 'matrixCalc', 'minDimension', 'maxDimension', 'minCellValue', 'maxCellValue', 'defaultValueForEmptyCell',
  ($scope, matrixCalc, minDimension, maxDimension, minCellValue, maxCellValue, defaultValueForEmptyCell) ->
    clearMatrix = (matrix) ->
      for row in matrix.values
        for col in [0..matrix.cols - 1]
          row[col] = undefined


    updateMatrix = (matrix) ->
      if matrix.values.length >= matrix.rows
        matrix.values.splice(matrix.rows)
      else
        for i in [0..matrix.rows - matrix.values.length - 1]
          matrix.values.push((undefined for i in [1..matrix.cols]))

      for i in [0..matrix.rows - 1]
        if matrix.values[i].length >= matrix.cols
          matrix.values[i].splice(matrix.cols)
        else
          for j in [0..matrix.cols - matrix.values[i].length - 1]
            matrix.values[i].push(undefined)

    updateAllMatrices = -> updateMatrix matrix for name, matrix of $scope.matrices

    updateCurrentMatrix = -> updateMatrix($scope.currentMatrix)


    fillEmptyCells = (matrix) ->
      for row in matrix.values
        for col in [0..matrix.cols - 1]
          if not angular.isDefined(row[col])
            row[col] = defaultValueForEmptyCell


    resetErrorState = ->
      $scope.state.error = false


    $scope.clearMatrices = ->
      clearMatrix matrix for name, matrix of $scope.matrices
      $scope.matrices.c.values = []

    $scope.swapMatrices = ->
      [$scope.matrices.a, $scope.matrices.b] = [$scope.matrices.b, $scope.matrices.a]
      # toggle currentMatrix to make sure it remains the same despite the swap
      $scope.currentMatrix = if angular.equals($scope.currentMatrix, $scope.matrices.a) then $scope.matrices.b else $scope.matrices.a
      resetErrorState()

    $scope.addRow = ->
      $scope.currentMatrix.rows++ unless $scope.currentMatrix.rows == maxDimension
      updateCurrentMatrix()
      resetErrorState()

    $scope.removeRow = ->
      $scope.currentMatrix.rows-- unless $scope.currentMatrix.rows == minDimension
      updateCurrentMatrix()
      resetErrorState()

    $scope.addColumn = ->
      $scope.currentMatrix.cols++ unless $scope.currentMatrix.cols == maxDimension
      updateCurrentMatrix()
      resetErrorState()

    $scope.removeColumn = ->
      $scope.currentMatrix.cols-- unless $scope.currentMatrix.cols == minDimension
      updateCurrentMatrix()
      resetErrorState()

    $scope.tryMultiply = ->
      resetErrorState()

      if $scope.matrices.a.cols == $scope.matrices.b.rows
        fillEmptyCells($scope.matrices.a)
        fillEmptyCells($scope.matrices.b)

        $scope.matrices.c.values = matrixCalc.multiply($scope.matrices.a.values, $scope.matrices.b.values)
      else
        $scope.state.error = true

    $scope.range = _.range

    init = ->
      $scope.state =
        editing: false
        error  : false

      $scope.matrices =
        a:
          cols  : 2
          rows  : 4
          values: []
        b:
          cols  : 3
          rows  : 2
          values: []
        c:
          values: []

      $scope.currentMatrix = $scope.matrices.a

      $scope.minDimension = minDimension
      $scope.maxDimension = maxDimension

      $scope.minCellValue = minCellValue
      $scope.maxCellValue = maxCellValue

      updateAllMatrices()

    init()
])