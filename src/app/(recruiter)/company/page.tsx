"use client";

import { useState } from "react";

export default function CompanyPage() {
  const [form, setForm] =
    useState({
      company_name: "",
      website: "",
      industry: "",
      company_size: "",
      about: "",
      location: "",
      remote_policy: "",
      logo_url: "",
    });

  return (
    <div className="max-w-4xl mx-auto p-8">

      <h1 className="text-3xl font-bold mb-6">
        Company Profile
      </h1>

      <div className="space-y-4">

        <input
          placeholder="Company Name"
          className="w-full border rounded p-3"
          value={form.company_name}
          onChange={(e) =>
            setForm({
              ...form,
              company_name:
                e.target.value,
            })
          }
        />

        <input
          placeholder="Website"
          className="w-full border rounded p-3"
          value={form.website}
          onChange={(e) =>
            setForm({
              ...form,
              website:
                e.target.value,
            })
          }
        />

        <select
  className="w-full border rounded p-3"
  value={form.industry}
  onChange={(e) =>
    setForm({
      ...form,
      industry:
        e.target.value,
    })
  }
>
  <option value="">
    Select Industry
  </option>

  <option value="Technology">
    Technology
  </option>

  <option value="Fintech">
    Fintech
  </option>

  <option value="Healthcare">
    Healthcare
  </option>

  <option value="E-Commerce">
    E-Commerce
  </option>

  <option value="Education">
    Education
  </option>

  <option value="Consulting">
    Consulting
  </option>

  <option value="Manufacturing">
    Manufacturing
  </option>

  <option value="Other">
    Other
  </option>
</select>
<select
  className="w-full border rounded p-3"
  value={form.company_size}
  onChange={(e) =>
    setForm({
      ...form,
      company_size:
        e.target.value,
    })
  }
>
  <option value="">
    Company Size
  </option>

  <option value="1-10">
    1-10 Employees
  </option>

  <option value="11-50">
    11-50 Employees
  </option>

  <option value="51-200">
    51-200 Employees
  </option>

  <option value="201-500">
    201-500 Employees
  </option>

  <option value="501-1000">
    501-1000 Employees
  </option>

  <option value="1000+">
    1000+ Employees
  </option>
</select>

        <textarea
          rows={5}
          placeholder="About Company"
          className="w-full border rounded p-3"
          value={form.about}
          onChange={(e) =>
            setForm({
              ...form,
              about:
                e.target.value,
            })
          }
        />
        <input
  placeholder="Company Location"
  className="w-full border rounded p-3"
  value={form.location}
  onChange={(e) =>
    setForm({
      ...form,
      location:
        e.target.value,
    })
  }
/>
<select
  className="w-full border rounded p-3"
  value={form.remote_policy}
  onChange={(e) =>
    setForm({
      ...form,
      remote_policy:
        e.target.value,
    })
  }
>
  <option value="">
    Remote Policy
  </option>

  <option value="remote">
    Fully Remote
  </option>

  <option value="hybrid">
    Hybrid
  </option>

  <option value="onsite">
    On-site
  </option>
</select>
<div className="border rounded-lg p-6 bg-gray-50">

  <div className="font-medium mb-2">
    Company Logo
  </div>

  <input
    type="text"
    placeholder="Logo URL"
    className="w-full border rounded p-3"
    value={form.logo_url}
    onChange={(e) =>
      setForm({
        ...form,
        logo_url:
          e.target.value,
      })
    }
  />

  <p className="text-sm text-gray-500 mt-2">
    File upload will be added later.
  </p>

</div>
<button
  className="
    bg-orange-500
    text-white
    px-6
    py-3
    rounded-lg
    font-semibold
  "
>
  Save Company Profile
</button>

      </div>

    </div>
  );
}