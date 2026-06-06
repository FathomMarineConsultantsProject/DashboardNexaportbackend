const express = require('express');
const supabase = require('../config/db');

import type { Request, Response, Router } from 'express';

const router: Router = express.Router();

const normalizeInspection = (row: any) => ({
  id: String(row.id),

  vessel: row.vessel ?? '',
  client: row.client ?? '',
  inspectionType: row.inspection_type ?? '',
  priority: row.priority ?? 'Normal',

  shipToInspect: row.ship_to_inspect ?? '',
  portLocation: row.port_location ?? '',
  shipManagerAuthority: row.ship_manager_authority ?? '',
  shipOwnerLegalEntity: row.ship_owner_legal_entity ?? '',

  agentFullName: row.agent_full_name ?? '',
  agentPrimaryContact: row.agent_primary_contact ?? '',
  agentDigitalEmail: row.agent_digital_email ?? '',
  agentPhoneSystem: row.agent_phone_system ?? '',
  agentWhatsappProtocol: row.agent_whatsapp_protocol ?? '',
  agentTelegramHandler: row.agent_telegram_handler ?? '',
  agentOutlookIdentityAddress: row.agent_outlook_identity_address ?? '',

  personInChargeName: row.person_in_charge_name ?? '',
  personInChargeContact: row.person_in_charge_contact ?? '',
  personInChargeWhatsapp: row.person_in_charge_whatsapp ?? '',
  personInChargeTelegram: row.person_in_charge_telegram ?? '',
  personInChargeOutlook: row.person_in_charge_outlook ?? '',

  superintendentName: row.superintendent_name ?? '',
  superintendentContact: row.superintendent_contact ?? '',
  superintendentWhatsapp: row.superintendent_whatsapp ?? '',
  superintendentTelegram: row.superintendent_telegram ?? '',
  superintendentOutlook: row.superintendent_outlook ?? '',

  scheduledDate: row.scheduled_date ?? '',
  location: row.location ?? '',
  scopeOfWork: row.scope_of_work ?? '',

  status: row.status ?? 'Pending',
  createdAt: row.created_at ?? '',
});

router.get('/', async (_req: Request, res: Response): Promise<any> => {
  try {
    const { data, error } = await supabase
      .from('inspections')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase inspection fetch error:', error);
      return res.status(500).json({
        success: false,
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
    }

    return res.status(200).json({
      success: true,
      inspections: (data ?? []).map(normalizeInspection),
    });
  } catch (error: any) {
    console.error('Inspection fetch crash:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server failure fetching inspections.',
    });
  }
});
router.get('/test', (_req: Request, res: Response) => {
  res.json({ success: true, message: 'Inspection routes working' });
});

router.post('/add', async (req: Request, res: Response): Promise<any> => {
  try {
    const body = req.body;

    if (!body.vessel || !body.client || !body.inspectionType) {
      return res.status(400).json({
        success: false,
        message: 'vessel, client and inspectionType are required.',
      });
    }

    const insertPayload = {
      vessel: body.vessel,
      client: body.client,
      inspection_type: body.inspectionType,
      priority: body.priority || 'Normal',

      ship_to_inspect: body.shipToInspect || null,
      port_location: body.portLocation || null,
      ship_manager_authority: body.shipManagerAuthority || null,
      ship_owner_legal_entity: body.shipOwnerLegalEntity || null,

      agent_full_name: body.agentFullName || null,
      agent_primary_contact: body.agentPrimaryContact || null,
      agent_digital_email: body.agentDigitalEmail || null,
      agent_phone_system: body.agentPhoneSystem || null,
      agent_whatsapp_protocol: body.agentWhatsappProtocol || null,
      agent_telegram_handler: body.agentTelegramHandler || null,
      agent_outlook_identity_address: body.agentOutlookIdentityAddress || null,

      person_in_charge_name: body.personInChargeName || null,
      person_in_charge_contact: body.personInChargeContact || null,
      person_in_charge_whatsapp: body.personInChargeWhatsapp || null,
      person_in_charge_telegram: body.personInChargeTelegram || null,
      person_in_charge_outlook: body.personInChargeOutlook || null,

      superintendent_name: body.superintendentName || null,
      superintendent_contact: body.superintendentContact || null,
      superintendent_whatsapp: body.superintendentWhatsapp || null,
      superintendent_telegram: body.superintendentTelegram || null,
      superintendent_outlook: body.superintendentOutlook || null,

      scheduled_date: body.scheduledDate || null,
      location: body.location || null,
      scope_of_work: body.scopeOfWork || null,

      status: 'Pending',
    };

    console.log('Inspection insert payload:', insertPayload);

    const { data, error } = await supabase
      .from('inspections')
      .insert(insertPayload)
      .select()
      .single();

    if (error) {
      console.error('Supabase inspection insert error:', error);
      return res.status(500).json({
        success: false,
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Inspection created successfully.',
      inspection: normalizeInspection(data),
    });
  } catch (error: any) {
    console.error('Inspection insert crash:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server failure saving inspection.',
    });
  }
});

router.delete('/:id', async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('inspections')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Inspection deleted successfully.',
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Delete failed.',
    });
  }
});

module.exports = router;