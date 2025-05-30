import path from 'path'

import { describe, expect, test } from 'vitest'

import { getFunctions } from '../../../../src/utils/functions/get-functions.js'
import { withSiteBuilder } from '../../../integration/utils/site-builder.js'

describe('getFunctions', () => {
  test('should return empty object when an empty string is provided', async () => {
    const funcs = await getFunctions('')
    expect(funcs).toEqual([])
  })

  test('should return an empty object for a directory with no js files', async (t) => {
    await withSiteBuilder(t, async (builder) => {
      await builder.build()

      const funcs = await getFunctions(builder.directory)
      expect(funcs).toEqual([])
    })
  })

  test('should return object with function details for a directory with js files', async (t) => {
    await withSiteBuilder(t, async (builder) => {
      builder.withFunction({
        path: 'index.js',
        handler: '',
      })
      await builder.build()

      const functions = path.join(builder.directory, 'functions')
      const funcs = await getFunctions(functions)
      expect(funcs).toEqual([
        {
          name: 'index',
          mainFile: path.join(builder.directory, 'functions', 'index.js'),
          isBackground: false,
          runtime: 'js',
          schedule: undefined,
          urlPath: '/.netlify/functions/index',
        },
      ])
    })
  })

  test('should mark background functions based on filenames', async (t) => {
    await withSiteBuilder(t, async (builder) => {
      builder
        .withFunction({
          path: 'foo-background.js',
          handler: '',
        })
        .withFunction({
          path: 'bar-background/bar-background.js',
          handler: '',
        })
      await builder.build()

      const functions = path.join(builder.directory, 'functions')
      const funcs = await getFunctions(functions)

      expect(funcs).toHaveLength(2)
      expect(funcs).toContainEqual({
        name: 'bar-background',
        mainFile: path.join(builder.directory, 'functions', 'bar-background', 'bar-background.js'),
        isBackground: true,
        runtime: 'js',
        schedule: undefined,
        urlPath: '/.netlify/functions/bar-background',
      })
      expect(funcs).toContainEqual({
        name: 'foo-background',
        mainFile: path.join(builder.directory, 'functions', 'foo-background.js'),
        isBackground: true,
        runtime: 'js',
        schedule: undefined,
        urlPath: '/.netlify/functions/foo-background',
      })
    })
  })
})
