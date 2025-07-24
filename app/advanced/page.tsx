'use client';

import { useState, useEffect } from 'react';

export default function AdvancedPage() {
    const [validityDays, setValidityDays] = useState("600");
    const [validationServer, setValidationServer] = useState("validity.crashdebug.dev");
    const [customDomain, setCustomDomain] = useState("");
    const [certs, setCerts] = useState<{ cert1: string; cert2: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [downloaded, setDownloaded] = useState<{ cert1: boolean; cert2: boolean }>({
        cert1: false,
        cert2: false,
    });

    const isCustom = validationServer === "custom";
    const isAllowAll = validationServer === "validity-aa.crashdebug.dev";

    const isValidDays = /^\d+$/.test(validityDays) && +validityDays >= 1 && +validityDays <= 1000;
    const isValidDomain = isCustom
        ? /^[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}$/i.test(customDomain.trim())
        : true;

    const canSubmit = isValidDays && isValidDomain;

    useEffect(() => {
        setCerts(null);
        setDownloaded({ cert1: false, cert2: false });
    }, [validityDays, validationServer, customDomain]);

    const fetchCerts = async () => {
        if (!certs) {
            setIsLoading(true);
            const query = new URLSearchParams({
                days: validityDays,
                server: isCustom ? customDomain.trim() : validationServer,
            }).toString();
            const res = await fetch(`/api/issue?${query}`);
            const data = await res.json();
            setCerts(data);
            setIsLoading(false);
            return data;
        }
        return certs;
    };

    const downloadCert = async (which: 'cert1' | 'cert2') => {
        const data = await fetchCerts();
        const blob = new Blob([data[which]], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${which}.mutual.json`;
        a.click();
        URL.revokeObjectURL(url);
        setDownloaded((prev) => ({ ...prev, [which]: true }));
    };

    return (
        <div className="font-sans min-h-screen bg-white dark:bg-black flex items-center justify-center p-8">
            <div className="flex flex-col gap-5 w-full max-w-sm text-sm">

                {/* Intro */}
                <div className="flex flex-col gap-2">
                    <div className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                        This interface allows advanced control over certificate generation.
                        You can adjust the validity period and configure which validation server
                        will be used to authenticate peer certificates.
                    </div>
                </div>

                {/* Request + Inputs Group */}
                <div className="flex flex-col gap-2">

                    {/* Request Button */}
                    <div className="pb-4">
                        <button
                            disabled={!canSubmit || isLoading}
                            onClick={() => fetchCerts()}
                            className={`h-12 w-full rounded-xl text-sm font-medium transition-colors active:scale-[0.98] ${
                                !canSubmit || isLoading
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-black text-white dark:bg-white dark:text-black hover:opacity-90 cursor-pointer'
                            }`}
                        >
                            {isLoading ? 'Generating…' : 'Request Certificates'}
                        </button>
                    </div>

                    {/* Validity Duration */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-gray-600 dark:text-gray-400">Certificate validity (1–1000 days)</label>
                        <input
                            type="number"
                            value={validityDays}
                            onChange={(e) => setValidityDays(e.target.value)}
                            className={`h-12 w-full rounded-xl px-4 text-sm border transition-colors outline-none ${
                                isValidDays
                                    ? 'bg-white dark:bg-neutral-900 border-gray-300 dark:border-neutral-700 text-black dark:text-white'
                                    : 'border-red-500 bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300'
                            }`}
                        />
                    </div>

                    {/* Validation Server Picker */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-gray-600 dark:text-gray-400">Mutual validation server</label>
                        <div className="relative">
                            <select
                                value={validationServer}
                                onChange={(e) => setValidationServer(e.target.value)}
                                className="appearance-none h-12 w-full rounded-xl px-4 pr-10 text-sm border transition-colors outline-none
                                    bg-white dark:bg-neutral-900 border-gray-300 dark:border-neutral-700 text-black dark:text-white cursor-pointer"
                            >
                                <option value="validity.crashdebug.dev">validity.crashdebug.dev</option>
                                <option value="validity-aa.crashdebug.dev">validity-aa.crashdebug.dev</option>
                                <option value="custom">Custom URL</option>
                            </select>
                            <div className="pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">▼</div>
                        </div>
                    </div>

                    {/* Warning */}
                    {isAllowAll && (
                        <div className="text-xs text-red-600 dark:text-red-400 leading-snug">
                            Warning: This is the <strong>“Always Allow”</strong> server.
                            It will accept <u>all certificates</u> regardless of validity.
                            Use only for testing. Unsafe for production.
                        </div>
                    )}

                    {/* Custom Domain */}
                    {isCustom && (
                        <div className="flex flex-col gap-1">
                            <label className="text-xs text-gray-600 dark:text-gray-400">Trusted entity domain</label>
                            <input
                                type="text"
                                value={customDomain}
                                onChange={(e) => setCustomDomain(e.target.value)}
                                placeholder="e.g. trust.example.com"
                                className={`h-12 w-full rounded-xl px-4 text-sm border transition-colors outline-none ${
                                    isValidDomain
                                        ? 'bg-white dark:bg-neutral-900 border-gray-300 dark:border-neutral-700 text-black dark:text-white'
                                        : 'border-red-500 bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300'
                                }`}
                            />
                        </div>
                    )}
                </div>

                {/* Download Group */}
                <div className="flex flex-col gap-3">
                    <div className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                        Once created, download both certificates and deploy them to the respective services.
                        Certificate 1 is for Service A, Certificate 2 for Service B.
                        Each file is unique and must be stored securely — never share private keys.
                    </div>
                    <div className="flex flex-col gap-2">
                        <button
                            disabled={!certs}
                            onClick={() => downloadCert('cert1')}
                            className={`h-12 w-full rounded-xl font-medium flex items-center justify-between px-4 ${
                                certs
                                    ? `bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-800 cursor-pointer
                                       ${downloaded.cert1 ? 'text-green-600 dark:text-green-400 border-green-500' : 'text-black dark:text-white'}`
                                    : 'border border-gray-300 dark:border-neutral-800 text-gray-500 bg-gray-100 dark:bg-neutral-900 dark:text-gray-600 cursor-not-allowed'
                            }`}
                        >
                            Download Certificate 1
                        </button>
                        <button
                            disabled={!certs}
                            onClick={() => downloadCert('cert2')}
                            className={`h-12 w-full rounded-xl font-medium flex items-center justify-between px-4 ${
                                certs
                                    ? `bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-800 cursor-pointer
                                       ${downloaded.cert2 ? 'text-green-600 dark:text-green-400 border-green-500' : 'text-black dark:text-white'}`
                                    : 'border border-gray-300 dark:border-neutral-800 text-gray-500 bg-gray-100 dark:bg-neutral-900 dark:text-gray-600 cursor-not-allowed'
                            }`}
                        >
                            Download Certificate 2
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
