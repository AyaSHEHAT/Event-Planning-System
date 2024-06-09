using Abp.Application.Services;
using Abp.Application.Services.Dto;
using Abp.Domain.Repositories;
using AutoMapper;
using Event_Planning_System.Event.Dto;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;

namespace Event_Planning_System.Event
{
    public class EventAppService : AsyncCrudAppService<Enitities.Event, EventDto, int, EventDto>, IEventAppService
    {
        private readonly IRepository<Enitities.Event, int> _repository;
        private readonly IMapper _mapper;
        private readonly string _imageFolderPath;

        public EventAppService(IRepository<Enitities.Event, int> repository, IMapper mapper) : base(repository)
        {
            _repository = repository;
            _mapper = mapper;
            _imageFolderPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images");
            if (!Directory.Exists(_imageFolderPath))
            {
                Directory.CreateDirectory(_imageFolderPath);
            }
        }

        public async Task<List<EventDto>> GetUserEventsAsync(long userId)
        {
            var events = await _repository.GetAllListAsync(e => e.UserId == userId);
            return _mapper.Map<List<EventDto>>(events);
        }

        public async Task<List<EventDto>> GetUpcomingEventsForCurrentUserAsync(long userId)
        {
            var today = DateTime.Today;
            var upcomingEvents = await _repository.GetAllListAsync(e => e.UserId == userId && e.StartDate >= today);
            return _mapper.Map<List<EventDto>>(upcomingEvents);
        }

        public async Task<List<EventDto>> GetHistoryEventAsync(long userId)
        {
            var today = DateTime.Today;
            var events = await _repository.GetAllListAsync(e => e.UserId == userId && e.EndDate < today);
            return _mapper.Map<List<EventDto>>(events);
        }

        public async Task<CreateEventDto> CreateWithImageAsync([FromForm]CreateEventDto input)
        {
            if (input.EventImgFile != null && input.EventImgFile.Length > 0)
            {
                var fileName = Guid.NewGuid().ToString() + Path.GetExtension(input.EventImgFile.FileName);
                var filePath = Path.Combine(_imageFolderPath, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await input.EventImgFile.CopyToAsync(stream);
                }

                input.EventImg = $"/images/{fileName}";
            }

            var eventEntity = _mapper.Map<Enitities.Event>(input);
            await _repository.InsertAsync(eventEntity);

            return _mapper.Map<CreateEventDto>(eventEntity);
        }
    }
    }
