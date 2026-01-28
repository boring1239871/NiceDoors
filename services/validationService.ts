import { CadModel, ProductTemplate, CadValidationResult } from '../types';

export const validateCadModel = (model: CadModel, template: ProductTemplate): CadValidationResult => {
  const errors: Record<string, string> = {};
  const { rules } = template;

  // Width Check
  if (model.width < rules.width.min) {
    errors.width = `最小宽度限制: ${rules.width.min}mm`;
  } else if (model.width > rules.width.max) {
    errors.width = `最大宽度限制: ${rules.width.max}mm`;
  }

  // Height Check
  if (model.height < rules.height.min) {
    errors.height = `最小高度限制: ${rules.height.min}mm`;
  } else if (model.height > rules.height.max) {
    errors.height = `最大高度限制: ${rules.height.max}mm`;
  }

  // Panel Check
  if (model.panels < rules.panels.min) {
    errors.panels = `最少分扇数: ${rules.panels.min}`;
  } else if (model.panels > rules.panels.max) {
    errors.panels = `最大分扇数: ${rules.panels.max}`;
  }

  // Transom Check
  if (model.transomHeight > 0 && !rules.allowTransom) {
    errors.transomHeight = "该产品系列不允许设置上亮/横挺";
  }
  if (model.transomHeight > 0 && model.transomHeight < 300) {
     errors.transomHeight = "上亮高度过小 (至少 300mm)";
  }
  if (model.transomHeight >= model.height - 300) {
    errors.transomHeight = "上亮高度必须小于总高度";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};