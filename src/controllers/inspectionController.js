"use strict";
const supabase = require('../config/db');
const validTabs = ['Overview', 'Quote', 'Confirm', 'Surveyor', 'Preparation', 'Checklist'];
const normalizeInspection = (row) => ({
    id: row.id,
    vesselName: row.vessel_name ?? row.vesselName,
    inspectionType: row.inspection_type ?? row.inspectionType,
    surveyor: row.surveyor,
    status: row.status,
    createdAt: row.created_at ?? row.createdAt,
    progress: {
        compliant: row.compliant_count ?? row.progress?.compliant ?? 0,
        nonCompliant: row.non_compliant_count ?? row.progress?.nonCompliant ?? 0,
        pending: row.pending_count ?? row.progress?.pending ?? 0,
        na: row.na_count ?? row.progress?.na ?? 0,
    },
});
const getAllInspections = async (_req, res) => {
    try {
        const { data, error } = await supabase
            .from('inspections')
            .select('*')
            .order('id', { ascending: false });
        if (error)
            throw error;
        res.status(200).json({
            success: true,
            count: data?.length ?? 0,
            data: (data ?? []).map(normalizeInspection),
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve inspections data',
            error: error.message,
        });
    }
};
const createInspection = async (req, res) => {
    try {
        const { vesselName, inspectionType, surveyor, status, progress } = req.body;
        if (!vesselName || !inspectionType) {
            res.status(400).json({
                success: false,
                message: 'Please provide both a vesselName and an inspectionType',
            });
            return;
        }
        const row = {
            vessel_name: vesselName,
            inspection_type: inspectionType,
            surveyor: surveyor || 'Unassigned',
            status: status || 'Overview',
            compliant_count: progress?.compliant || 0,
            non_compliant_count: progress?.nonCompliant || 0,
            pending_count: progress?.pending || 0,
            na_count: progress?.na || 0,
        };
        const { data, error } = await supabase
            .from('inspections')
            .insert(row)
            .select()
            .single();
        if (error)
            throw error;
        res.status(201).json({
            success: true,
            data: normalizeInspection(data),
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Supabase error during inspection creation',
            error: error.message,
        });
    }
};
const updateInspectionStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        if (!validTabs.includes(status)) {
            res.status(400).json({ success: false, message: 'Invalid workflow pipeline target stage' });
            return;
        }
        const { data, error } = await supabase
            .from('inspections')
            .update({ status })
            .eq('id', id)
            .select()
            .maybeSingle();
        if (error)
            throw error;
        if (!data) {
            res.status(404).json({ success: false, message: 'Inspection entry not found' });
            return;
        }
        res.status(200).json({ success: true, data: normalizeInspection(data) });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
module.exports = {
    getAllInspections,
    createInspection,
    updateInspectionStatus,
};
//# sourceMappingURL=inspectionController.js.map