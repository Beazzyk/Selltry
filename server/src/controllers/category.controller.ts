import { Request, Response, NextFunction } from 'express';
import { CategoryType } from '@prisma/client';
import * as categoryService from '../services/category.service';

export async function getCategories(req: Request, res: Response, next: NextFunction) {
  try {
    const { type } = req.query;
    const validType = type && Object.values(CategoryType).includes(type as CategoryType)
      ? (type as CategoryType)
      : undefined;
    const tree = await categoryService.getCategoryTree(validType);
    res.json(tree);
  } catch (err) {
    next(err);
  }
}

export async function getCategoryTypes(req: Request, res: Response, next: NextFunction) {
  try {
    const types = await categoryService.getCategoryTypes();
    res.json(types);
  } catch (err) {
    next(err);
  }
}

export async function getBrands(req: Request, res: Response, next: NextFunction) {
  try {
    const { type } = req.query;
    if (!type || !Object.values(CategoryType).includes(type as CategoryType)) {
      res.status(400).json({ error: 'Valid ?type= required' });
      return;
    }
    const brands = await categoryService.getBrands(type as CategoryType);
    res.json(brands);
  } catch (err) {
    next(err);
  }
}

export async function getVehicleMakes(req: Request, res: Response, next: NextFunction) {
  try {
    const { type } = req.query;
    const makes = await categoryService.getVehicleMakes(type as string | undefined);
    res.json(makes);
  } catch (err) {
    next(err);
  }
}

export async function getVehicleModels(req: Request, res: Response, next: NextFunction) {
  try {
    const models = await categoryService.getVehicleModels(req.params.makeId);
    res.json(models);
  } catch (err) {
    next(err);
  }
}

export async function getVehicleGenerations(req: Request, res: Response, next: NextFunction) {
  try {
    const generations = await categoryService.getVehicleGenerations(req.params.modelId);
    res.json(generations);
  } catch (err) {
    next(err);
  }
}
